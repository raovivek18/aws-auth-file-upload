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
    }
  }
`;
