/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
    }
  }
`;
export const listFileMetadatas = /* GraphQL */ `
  query ListFileMetadatas(
    $filter: ModelFileMetadataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFileMetadatas(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
      }
      nextToken
    }
  }
`;
