import { Spinner } from "theme-ui";
import FullPage from "../FullPage";

const LoadingPage: React.FunctionComponent = () => (
  <FullPage>
    <Spinner variant="styles.spinner" id="spinner" />
  </FullPage>
);

export default LoadingPage;
