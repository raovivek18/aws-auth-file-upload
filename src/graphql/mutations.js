/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFileMetadata = /* GraphQL */ `
  mutation CreateFileMetadata(
    $input: CreateFileMetadataInput!
    $condition: ModelFileMetadataConditionInput
  ) {
    createFileMetadata(input: $input, condition: $condition) {
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
export const updateFileMetadata = /* GraphQL */ `
  mutation UpdateFileMetadata(
    $input: UpdateFileMetadataInput!
    $condition: ModelFileMetadataConditionInput
  ) {
    updateFileMetadata(input: $input, condition: $condition) {
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
export const deleteFileMetadata = /* GraphQL */ `
  mutation DeleteFileMetadata(
    $input: DeleteFileMetadataInput!
    $condition: ModelFileMetadataConditionInput
  ) {
    deleteFileMetadata(input: $input, condition: $condition) {
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
export const createActivityLog = /* GraphQL */ `
  mutation CreateActivityLog(
    $input: CreateActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    createActivityLog(input: $input, condition: $condition) {
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
export const updateActivityLog = /* GraphQL */ `
  mutation UpdateActivityLog(
    $input: UpdateActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    updateActivityLog(input: $input, condition: $condition) {
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
export const deleteActivityLog = /* GraphQL */ `
  mutation DeleteActivityLog(
    $input: DeleteActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    deleteActivityLog(input: $input, condition: $condition) {
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
