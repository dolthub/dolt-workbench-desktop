import useOnRouteChange from "@hooks/useOnRouteChange";
import { UploadParamsWithOptions } from "@lib/params";
import Navigation from "./Navigation";
import PageWrapper from "./PageWrapper";
import Branch from "./Steps/Branch";
import Table from "./Steps/Table";
import Upload from "./Steps/Upload";
import { useFileUploadContext } from "./contexts/fileUploadLocalForage";
import { UploadStage, getUploadStage } from "./enums";

type InnerProps = {
  stage?: string;
};

type Props = InnerProps & {
  params: UploadParamsWithOptions;
};

function Inner(props: InnerProps) {
  const { clear, isDolt } = useFileUploadContext();
  const activeStage = getUploadStage(props.stage, isDolt);

  useOnRouteChange(url => {
    if (!url.includes("/upload")) {
      clear().catch(console.error);
    }
  });

  return (
    <div>
      <Navigation activeStage={activeStage} />
      <Stage activeStage={activeStage} />
    </div>
  );
}

function Stage(props: { activeStage: UploadStage }) {
  switch (props.activeStage) {
    case UploadStage.Branch:
      return <Branch />;
    case UploadStage.Table:
      return <Table />;
    case UploadStage.Upload:
      return <Upload />;
    default:
      return <Branch />;
  }
}

export default function FileUploadPage(props: Props) {
  return (
    <PageWrapper {...props}>
      <Inner stage={props.stage} />
    </PageWrapper>
  );
}
