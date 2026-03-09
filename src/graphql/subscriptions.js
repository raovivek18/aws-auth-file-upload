/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateActivityLog = /* GraphQL */ `
  subscription OnCreateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $userId: String
  ) {
    onCreateActivityLog(filter: $filter, userId: $userId) {
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
export const onUpdateActivityLog = /* GraphQL */ `
  subscription OnUpdateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $userId: String
  ) {
    onUpdateActivityLog(filter: $filter, userId: $userId) {
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
export const onDeleteActivityLog = /* GraphQL */ `
  subscription OnDeleteActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $userId: String
  ) {
    onDeleteActivityLog(filter: $filter, userId: $userId) {
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
export const onCreateUserAnalytics = /* GraphQL */ `
  subscription OnCreateUserAnalytics(
    $filter: ModelSubscriptionUserAnalyticsFilterInput
    $userId: String
  ) {
    onCreateUserAnalytics(filter: $filter, userId: $userId) {
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
export const onUpdateUserAnalytics = /* GraphQL */ `
  subscription OnUpdateUserAnalytics(
    $filter: ModelSubscriptionUserAnalyticsFilterInput
    $userId: String
  ) {
    onUpdateUserAnalytics(filter: $filter, userId: $userId) {
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
export const onDeleteUserAnalytics = /* GraphQL */ `
  subscription OnDeleteUserAnalytics(
    $filter: ModelSubscriptionUserAnalyticsFilterInput
    $userId: String
  ) {
    onDeleteUserAnalytics(filter: $filter, userId: $userId) {
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
export const onCreateSharedFile = /* GraphQL */ `
  subscription OnCreateSharedFile(
    $filter: ModelSubscriptionSharedFileFilterInput
    $userId: String
    $sharedWith: String
  ) {
    onCreateSharedFile(
      filter: $filter
      userId: $userId
      sharedWith: $sharedWith
    ) {
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
export const onUpdateSharedFile = /* GraphQL */ `
  subscription OnUpdateSharedFile(
    $filter: ModelSubscriptionSharedFileFilterInput
    $userId: String
    $sharedWith: String
  ) {
    onUpdateSharedFile(
      filter: $filter
      userId: $userId
      sharedWith: $sharedWith
    ) {
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
export const onDeleteSharedFile = /* GraphQL */ `
  subscription OnDeleteSharedFile(
    $filter: ModelSubscriptionSharedFileFilterInput
    $userId: String
    $sharedWith: String
  ) {
    onDeleteSharedFile(
      filter: $filter
      userId: $userId
      sharedWith: $sharedWith
    ) {
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
export const onCreateFileMetadata = /* GraphQL */ `
  subscription OnCreateFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $userId: String
  ) {
    onCreateFileMetadata(filter: $filter, userId: $userId) {
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
export const onUpdateFileMetadata = /* GraphQL */ `
  subscription OnUpdateFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $userId: String
  ) {
    onUpdateFileMetadata(filter: $filter, userId: $userId) {
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
export const onDeleteFileMetadata = /* GraphQL */ `
  subscription OnDeleteFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $userId: String
  ) {
    onDeleteFileMetadata(filter: $filter, userId: $userId) {
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
