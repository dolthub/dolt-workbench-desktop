import DiffTable from "@components/DiffTable";
import DiffTableNav from "@components/DiffTableNav";
import PullsBreadcrumbs from "@components/breadcrumbs/PullsBreadcrumbs";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { DiffProvider } from "@contexts/diff";
import { RequiredPullDiffParams } from "@lib/params";
import { pulls } from "@lib/urls";
import ForDefaultBranch from "../ForDefaultBranch";

type Props = {
  params: RequiredPullDiffParams & { refName?: string };
  tableName?: string;
};

export default function ForPullDiff(props: Props) {
  return (
    <DiffProvider
      params={{
        ...props.params,
        fromRefName: props.params.fromBranchName,
        toRefName: props.params.toBranchName,
      }}
      initialTableName={props.tableName}
      forPull
    >
      <ForDefaultBranch
        initialTabIndex={4}
        params={props.params}
        routeRefChangeTo={pulls}
        title="pulls"
        smallHeaderBreadcrumbs={<PullsBreadcrumbs params={props.params} />}
        initialSmallHeader
        leftTableNav={<DiffTableNav.ForPull {...props} />}
        wide
        hideDefaultTable
      >
        <NotDoltWrapper showNotDoltMsg feature="Viewing pull requests" bigMsg>
          <DiffTable {...props} />
        </NotDoltWrapper>
      </ForDefaultBranch>
    </DiffProvider>
  );
}
