/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getActivityLog = /* GraphQL */ `
  query GetActivityLog($id: ID!) {
    getActivityLog(id: $id) {
      id
      userId
      actionType
      timestamp
      fileId
      fileName
      ip
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listActivityLogs = /* GraphQL */ `
  query ListActivityLogs(
    $filter: ModelActivityLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listActivityLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        actionType
        timestamp
        fileId
        fileName
        ip
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const listLogsByUser = /* GraphQL */ `
  query ListLogsByUser(
    $userId: String!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelActivityLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLogsByUser(
      userId: $userId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        actionType
        timestamp
        fileId
        fileName
        ip
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getFileMetadata = /* GraphQL */ `
  query GetFileMetadata($id: ID!) {
    getFileMetadata(id: $id) {
      id
      name
      size
      type
      key
      owner
      sharingStatus
      shareExpiration
      uploadTimestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listFileMetadata = /* GraphQL */ `
  query ListFileMetadata(
    $filter: ModelFileMetadataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFileMetadata(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        size
        type
        key
        owner
        sharingStatus
        shareExpiration
        uploadTimestamp
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
