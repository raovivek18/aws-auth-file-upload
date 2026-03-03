/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateActivityLog = /* GraphQL */ `
  subscription OnCreateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $owner: String
  ) {
    onCreateActivityLog(filter: $filter, owner: $owner) {
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
export const onUpdateActivityLog = /* GraphQL */ `
  subscription OnUpdateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $owner: String
  ) {
    onUpdateActivityLog(filter: $filter, owner: $owner) {
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
export const onDeleteActivityLog = /* GraphQL */ `
  subscription OnDeleteActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
    $owner: String
  ) {
    onDeleteActivityLog(filter: $filter, owner: $owner) {
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
export const onCreateFileMetadata = /* GraphQL */ `
  subscription OnCreateFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $owner: String
  ) {
    onCreateFileMetadata(filter: $filter, owner: $owner) {
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
export const onUpdateFileMetadata = /* GraphQL */ `
  subscription OnUpdateFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $owner: String
  ) {
    onUpdateFileMetadata(filter: $filter, owner: $owner) {
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
export const onDeleteFileMetadata = /* GraphQL */ `
  subscription OnDeleteFileMetadata(
    $filter: ModelSubscriptionFileMetadataFilterInput
    $owner: String
  ) {
    onDeleteFileMetadata(filter: $filter, owner: $owner) {
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
