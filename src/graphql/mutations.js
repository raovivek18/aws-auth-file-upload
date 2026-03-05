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
export const createUserAnalytics = /* GraphQL */ `
  mutation CreateUserAnalytics(
    $input: CreateUserAnalyticsInput!
    $condition: ModelUserAnalyticsConditionInput
  ) {
    createUserAnalytics(input: $input, condition: $condition) {
      id
      totalFiles
      totalStorage
      totalShares
      storageLimit
      lastActive
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateUserAnalytics = /* GraphQL */ `
  mutation UpdateUserAnalytics(
    $input: UpdateUserAnalyticsInput!
    $condition: ModelUserAnalyticsConditionInput
  ) {
    updateUserAnalytics(input: $input, condition: $condition) {
      id
      totalFiles
      totalStorage
      totalShares
      storageLimit
      lastActive
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteUserAnalytics = /* GraphQL */ `
  mutation DeleteUserAnalytics(
    $input: DeleteUserAnalyticsInput!
    $condition: ModelUserAnalyticsConditionInput
  ) {
    deleteUserAnalytics(input: $input, condition: $condition) {
      id
      totalFiles
      totalStorage
      totalShares
      storageLimit
      lastActive
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const createSharedFile = /* GraphQL */ `
  mutation CreateSharedFile(
    $input: CreateSharedFileInput!
    $condition: ModelSharedFileConditionInput
  ) {
    createSharedFile(input: $input, condition: $condition) {
      id
      fileId
      sharedWith
      ownerId
      ownerEmail
      fileName
      fileKey
      fileSize
      fileType
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteSharedFile = /* GraphQL */ `
  mutation DeleteSharedFile(
    $input: DeleteSharedFileInput!
    $condition: ModelSharedFileConditionInput
  ) {
    deleteSharedFile(input: $input, condition: $condition) {
      id
      fileId
      sharedWith
      ownerId
      ownerEmail
      fileName
      fileKey
      fileSize
      fileType
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
