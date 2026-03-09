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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserAnalytics = /* GraphQL */ `
  query GetUserAnalytics($id: ID!) {
    getUserAnalytics(id: $id) {
      id
      totalFiles
      totalStorage
      totalShares
      storageLimit
      lastActive
      createdAt
      updatedAt
      userId
      __typename
    }
  }
`;
export const listUserAnalytics = /* GraphQL */ `
  query ListUserAnalytics(
    $filter: ModelUserAnalyticsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserAnalytics(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        totalFiles
        totalStorage
        totalShares
        storageLimit
        lastActive
        createdAt
        updatedAt
        userId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSharedFile = /* GraphQL */ `
  query GetSharedFile($id: ID!) {
    getSharedFile(id: $id) {
      id
      fileId
      sharedWith
      userId
      ownerEmail
      fileName
      fileKey
      fileSize
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSharedFiles = /* GraphQL */ `
  query ListSharedFiles(
    $filter: ModelSharedFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSharedFiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fileId
        sharedWith
        userId
        ownerEmail
        fileName
        fileKey
        fileSize
        fileType
        createdAt
        updatedAt
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const sharedFilesByFileId = /* GraphQL */ `
  query SharedFilesByFileId(
    $fileId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelSharedFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    sharedFilesByFileId(
      fileId: $fileId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        fileId
        sharedWith
        userId
        ownerEmail
        fileName
        fileKey
        fileSize
        fileType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const listSharedWithMe = /* GraphQL */ `
  query ListSharedWithMe(
    $sharedWith: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelSharedFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSharedWithMe(
      sharedWith: $sharedWith
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        fileId
        sharedWith
        userId
        ownerEmail
        fileName
        fileKey
        fileSize
        fileType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const sharedFilesByUserId = /* GraphQL */ `
  query SharedFilesByUserId(
    $userId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSharedFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    sharedFilesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        fileId
        sharedWith
        userId
        ownerEmail
        fileName
        fileKey
        fileSize
        fileType
        createdAt
        updatedAt
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
      userId
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
        userId
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
export const listFileMetadataByUser = /* GraphQL */ `
  query ListFileMetadataByUser(
    $userId: String!
    $uploadTimestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFileMetadataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFileMetadataByUser(
      userId: $userId
      uploadTimestamp: $uploadTimestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        size
        type
        key
        userId
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
