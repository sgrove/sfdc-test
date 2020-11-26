/* SetStage.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { auth } from "./Config";
import { useMutation } from "react-relay/hooks";
import { suggestCORSSetup, LocationNote, updateFormVariables } from "./utils";
import Oppty from "./Oppty";

const SET_STAGE_MUTATION = graphql`
  mutation SetStage_SetStageMutation($id: String!, $stageName: String!) {
    salesforce {
      updateOpportunity(input: { patch: { stageName: $stageName }, id: $id }) {
        opportunity {
          ...Oppty_fragment
        }
      }
    }
  }
`;

export default function SetStageMutation(props) {
  const [mutationResult, setMutationResult] = React.useState(() => null);
  const [formVariables, setFormVariables] = React.useState({ ...props });

  const [commit, isInFlight] = useMutation(SET_STAGE_MUTATION);

  const runMutation = () =>
    commit({
      variables: formVariables,
      onError: (error) => {
        setMutationResult({ errors: [error] });
      },
      onCompleted: (response, errors) => {
        setMutationResult({ data: response, errors: errors });
      },
    });

  const formEl = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        runMutation();
      }}
    >
      <label htmlFor="id">id</label>
      <input
        id="id"
        type="text"
        onChange={updateFormVariables(
          setFormVariables,
          ["id"],
          (value) => value
        )}
      />
      <label htmlFor="stageName">stageName</label>
      <input
        id="stageName"
        type="text"
        onChange={updateFormVariables(
          setFormVariables,
          ["stageName"],
          (value) => value
        )}
      />
      <input type="submit" />
    </form>
  );

  const opptyUses = (
    <Oppty
      opportunity={
        mutationResult?.data?.salesforce?.updateOpportunity?.opportunity
      }
    />
  );

  const dataEl = mutationResult?.data ? (
    <div className="data-box">
      <h3>Data for SetStageMutation</h3>
      <h4>
        OpptyUses <LocationNote />
      </h4>
      {opptyUses}
    </div>
  ) : null;

  const primaryError = mutationResult?.errors?.[0];

  const errorEl = primaryError ? (
    <div className="error-box">
      Error in SetStageMutation. <br />
      {suggestCORSSetup(primaryError)}
      <pre>{JSON.stringify(mutationResult?.errors, null, 2)}</pre>
    </div>
  ) : null;

  const loadingEl = isInFlight ? (
    <pre className="loading">Loading...</pre>
  ) : null;

  const needsLoginService = auth.findMissingAuthServices(mutationResult)[0];

  const actionButton = (
    <button
      className={!!needsLoginService ? "login-hint" : null}
      onClick={async () => {
        if (!needsLoginService) {
          runMutation();
        } else {
          await auth.login(needsLoginService);
          const loginSuccess = await auth.isLoggedIn(needsLoginService);
          if (loginSuccess) {
            console.log("Successfully logged into " + needsLoginService);
            runMutation();
          } else {
            console.log("The user did not grant auth to " + needsLoginService);
          }
        }
      }}
    >
      {needsLoginService
        ? "Log in to " + needsLoginService
        : "Run SetStageMutation"}
    </button>
  );

  return (
    <div>
      <h3>
        SetStageMutation <LocationNote />
      </h3>
      {formEl}
      {actionButton}
      {loadingEl}
      {dataEl}
      {errorEl}
    </div>
  );
}
