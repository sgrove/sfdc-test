/* Oppty.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay/hooks";
import { stringifyRelayData, LocationNote } from "./utils";
import Owner from "./Owner";

export default function Oppty(props) {
  const data = useFragment(
    graphql`
      fragment Oppty_fragment on SalesforceOpportunity {
        name
        isWon
        description
        amount
        id
        oneGraphId
        stageName
        probability
        owner {
          ...Owner_fragment
        }
      }
    `,
    props.opportunity
  );

  const ownerUses = <Owner user={data?.owner} />;

  return (
    <>
      <div className="data-box">
        <h3>
          Data for Oppty <LocationNote />
        </h3>
        <pre>{stringifyRelayData(data)}</pre>
        <h4>
          OwnerUses <LocationNote />
        </h4>
        {ownerUses}
      </div>
    </>
  );
}
