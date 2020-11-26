/* Owner.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay/hooks";
import { stringifyRelayData, LocationNote } from "./utils";

export default function Owner(props) {
  const data = useFragment(
    graphql`
      fragment Owner_fragment on SalesforceUser {
        aboutMe
        name
        oneGraphId
        fullPhotoUrl
      }
    `,
    props.user
  );

  return (
    <>
      <div className="data-box">
        <h3>
          Data for Owner <LocationNote />
        </h3>
        <pre>{stringifyRelayData(data)}</pre>
      </div>
    </>
  );
}
