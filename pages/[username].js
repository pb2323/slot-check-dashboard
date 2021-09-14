import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { List } from "semantic-ui-react";

export default function Account({ user }) {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>User Details</h1>
      <List>
        <List.Item size="massive">
          <strong>Name :</strong>
          {user.name}
        </List.Item>
        <List.Item size="massive">
          <strong>Email :</strong>
          {user.email}
        </List.Item>
        <List.Item size="massive">
          <strong>Username :</strong>
          {user.username}
        </List.Item>
        <List.Item size="massive">
          <strong>Role :</strong>
          {user.role}
        </List.Item>
      </List>
    </div>
  );
}
