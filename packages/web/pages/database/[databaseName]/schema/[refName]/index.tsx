import Page from "@components/util/Page";
import { RefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: RefParams & { active?: string };
};

const SchemaPage: NextPage<Props> = ({ params }) => (
  <Page title={`${params.databaseName} - Schema`} noIndex>
    <DatabasePage.ForSchema params={params} />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as RefParams),
        active: query.active ? String(query.active) : "",
      },
    },
  };
};

export default SchemaPage;
