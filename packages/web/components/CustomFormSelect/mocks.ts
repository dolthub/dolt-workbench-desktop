import { MockedResponse } from "@apollo/client/testing";
import {
  BranchesForSelectorDocument,
  BranchForBranchSelectorFragment,
} from "@gen/graphql-types";
import chance from "@lib/chance";
import { DatabaseParams } from "@lib/params";
import { defaultBranchMock } from "@pageComponents/DatabasePage/ForDefaultBranch/mocks";

export const fakeParams: DatabaseParams = {
  databaseName: "dbname",
};

export const randomSelect = chance.name();
export const fakeBranchName = "test-branch";
export const defaultBranchQuery = defaultBranchMock({
  ...fakeParams,
  branchName: fakeBranchName,
});

export const mainBranch = (
  params: DatabaseParams,
): BranchForBranchSelectorFragment => {
  return {
    __typename: "Branch",
    ...params,
    branchName: "main",
  };
};

const testBranch = (
  params: DatabaseParams,
): BranchForBranchSelectorFragment => {
  return {
    __typename: "Branch",
    ...params,
    branchName: "test",
  };
};

export const branchTests = [
  {
    title: "test: no selected value with branches",
    empty: false,
    selected: "",
    error: false,
  },
  {
    title: "test: selected value as random value with branches",
    empty: false,
    selected: randomSelect,
    error: false,
  },
  {
    title: "test: empty",
    empty: true,
    selected: "",
    error: false,
  },
  {
    title: "test: error",
    empty: true,
    selected: "",
    error: true,
  },
];

export const branchSelectorMock = (
  params: DatabaseParams,
  empty?: boolean,
): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    result: {
      data: {
        branchNames: {
          __typename: "BranchNamesList",
          list: empty ? [] : [testBranch(params), mainBranch(params)],
          nextPageToken: "",
        },
      },
    },
  };
};

export const noBranchMock = (params: DatabaseParams): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    result: {
      data: {
        branchNames: {
          __typename: "BranchNamesList",
          list: [],
          nextOffset: "",
        },
      },
    },
  };
};

export const oneBranchMock = (params: DatabaseParams): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    result: {
      data: {
        branchNames: {
          __typename: "BranchNamesList",
          list: [mainBranch(params)],
          nextOffset: "",
        },
      },
    },
  };
};

export const branchError = "branch error";
export const errorMock = (params: DatabaseParams): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    error: new Error(branchError),
  };
};

// const commitMock = (): CommitForHistoryFragment => {
//   const commitId = fakeCommitId();
//   return {
//     __typename: "Commit",
//     _id: `databases/${fakeParams.databaseName}/commits/${commitId}`,
//     commitId,
//     message: chance.sentence(),
//     committedAt: Date.now(),
//     parents: [],
//     committer: {
//       __typename: "DoltWriter",
//       _id: fakeUserEmailAddress().address,
//       displayName: chance.name(),
//       username: chance.word(),
//       emailAddress: fakeUserEmailAddress().address,
//     },
//   };
// };

// export const commitPicked = commitMock();
// export const commitNotPicked = commitMock();

// export const commitTests = [
//   {
//     title: "test: no selected value with commits",
//     empty: false,
//     selected: "",
//     error: false,
//   },
//   {
//     title: "test: selected value as commitId with commits",
//     empty: false,
//     selected: commitPicked.commitId,
//     error: false,
//   },
//   {
//     title: "test: selected value as random value with commits",
//     empty: false,
//     selected: randomSelect,
//     error: false,
//   },
//   {
//     title: "test: empty",
//     empty: true,
//     selected: "",
//     error: false,
//   },
//   {
//     title: "test: error",
//     empty: true,
//     selected: "",
//     error: true,
//   },
// ];

// export const commitsListMock = (empty: boolean): MockedResponse[] => [
//   {
//     request: {
//       query: HistoryForBranchDocument,
//       variables: {
//         databaseName: fakeParams.databaseName,
//         refName: fakeBranchName,
//       },
//     },
//     result: {
//       data: {
//         __typename: "Query",
//         commits: {
//           __typename: "CommitList",
//           nextOffset: "",
//           list: empty ? [] : [commitPicked, commitNotPicked],
//         },
//       },
//     },
//   },
// ];

// export const commitError = "Commit Error";

// export const mockCommitError = (): MockedResponse[] => [
//   {
//     request: {
//       query: HistoryForBranchDocument,
//       variables: {
//         databaseName: fakeParams.databaseName,
//         refName: fakeBranchName,
//       },
//     },
//     error: new Error(commitError),
//   },
// ];
