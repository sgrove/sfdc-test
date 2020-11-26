/* Opptys.js */
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLazyLoadQuery } from "react-relay/hooks";
import { auth } from "./Config";
import { ErrorFallback, LocationNote } from "./utils";
import graphql from "babel-plugin-relay/macro";
import { createPaginationContainer } from "react-relay";
import Oppty from "./Oppty";

export function PaginatedSalesforceOpportunities(props) {
  const { relay, salesforceForPaginatedOpportunities } = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const opptyUses = salesforceForPaginatedOpportunities?.opportunities?.edges?.map(
    (item, idx) => (
      <Oppty key={item?.node?.id || idx} opportunity={item?.node} />
    )
  );

  const loadMoreCount = 2;

  return (
    <div>
      <h4>
        OpptyUses <LocationNote />
      </h4>
      {opptyUses}
      <button
        className={isLoading ? "loading" : null}
        disabled={!relay.hasMore()}
        onClick={() => {
          if (!relay.isLoading()) {
            setIsLoading(true);
            relay.loadMore(loadMoreCount, (results) => {
              console.log("Loaded more opportunities: ", results);
              setIsLoading(false);
            });
          }
        }}
      >
        {isLoading
          ? "Loading more opportunities..."
          : relay.hasMore()
          ? `Fetch ${loadMoreCount} more opportunities`
          : "All opportunities have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedSalesforceOpportunitiesContainer = createPaginationContainer(
  PaginatedSalesforceOpportunities,
  {
    salesforceForPaginatedOpportunities: graphql`
      fragment Opptys_salesforceForPaginatedOpportunities on SalesforceQuery
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 10 }
        cursor: { type: "String" }
      ) {
        opportunities(first: $count, after: $cursor)
          @connection(
            key: "Opptys_salesforceForPaginatedOpportunities_opportunities"
          ) {
          edges {
            node {
              ...Oppty_fragment
            }
          }
        }
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props?.salesforceForPaginatedOpportunities?.opportunities;
    },
    getVariables(props, pagination, fragmentVariables) {
      const { count, cursor } = pagination;
      return { ...fragmentVariables, count: count, cursor: cursor };
    },
    query: graphql`
      query Opptys_PaginatedSalesforceOpportunitiesContainerQuery(
        $count: Int = 10
        $cursor: String
      ) {
        salesforce {
          ...Opptys_salesforceForPaginatedOpportunities
            @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  }
);

const OPPTYS_QUERY = graphql`
  query OpptysQuery {
    salesforce {
      ...Opptys_salesforceForPaginatedOpportunities @arguments
    }
  }
`;

export function OpptysQuery(props) {
  const data = useLazyLoadQuery(OPPTYS_QUERY, props, {
    // Try to render from the store if we have some data available, but also refresh from the network
    fetchPolicy: "store-and-network",
    // Refetch the query if we've logged in/out of any service
    fetchKey: auth.accessToken()?.accessToken,
  });

  console.log("OPPTYS_QUERY data", data);
  const paginatedSalesforceOpportunitiesUses = (
    <PaginatedSalesforceOpportunitiesContainer
      salesforceForPaginatedOpportunities={data?.salesforce}
    />
  );

  return (
    <div>
      <h4>
        PaginatedSalesforceOpportunitiesUses <LocationNote />
      </h4>
      {paginatedSalesforceOpportunitiesUses}
    </div>
  );
}

export default function OpptysQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({ ...props });
  const [formVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setQueryVariables({ ...formVariables });
      }}
    >
      <input type="submit" />
    </form>
  );

  /** If there's an error in the query component (Missing authentication, missing variable, CORS error, etc.)
      we'll let the ErrorBoundary handle the 'try again' action */
  const actionButtonEl = hasError ? null : (
    <button onClick={() => setQueryVariables({ ...formVariables })}>
      Run OpptysQuery
    </button>
  );

  return (
    <div>
      <h3>Opptys</h3>
      {formEl}
      {actionButtonEl}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // reset the state of your app so the error doesn't happen again
          console.log("Reset queryVariables to trigger query run");
          setHasError(false);
          setQueryVariables({ ...props, ...formVariables });
        }}
        onError={(err) => {
          setHasError(true);
          console.log("Error detected:", err);
        }}
      >
        <Suspense fallback={"Loading OpptysQuery..."}>
          <OpptysQuery {...queryVariables} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
