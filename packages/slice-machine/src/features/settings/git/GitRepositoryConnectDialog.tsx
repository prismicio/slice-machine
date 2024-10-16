import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActionLink,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  FormInput,
  Text,
} from "@prismicio/editor-ui";
import type { GitRepo, GitRepoSpecifier } from "@slicemachine/manager";
import { Formik } from "formik";
import type { FC, ReactNode } from "react";
import { toast } from "react-toastify";

import { gitProviderToConfig } from "@/features/settings/git/GitProvider";
import { useWriteAPIToken } from "@/features/settings/git/useWriteAPIToken";
import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

type GitRepositoryConnectDialogProps = {
  linkRepo: (repo: GitRepoSpecifier) => Promise<void>;
  repo: GitRepo;
  trigger: ReactNode;
};

// TODO: Update form to make it work with editor-ui Form component when
// we start to work again on Git integration
export const GitRepositoryConnectDialog: FC<
  GitRepositoryConnectDialogProps
> = ({ linkRepo, repo, trigger }) => {
  const providerConfig = gitProviderToConfig[repo.provider];
  const { updateToken } = useWriteAPIToken({ git: repo });
  const { repositoryUrl } = useRepositoryInformation();
  return (
    <Dialog size={{ width: 448, height: "auto" }} trigger={trigger}>
      <DialogHeader title="Prismic Write API token required" />
      <DialogContent>
        <Formik
          initialValues={{ writeAPIToken: "" }}
          validate={(values) => {
            if (values.writeAPIToken.length === 0) {
              return { writeAPIToken: "Cannot be empty" };
            }
          }}
          onSubmit={async (values) => {
            try {
              await linkRepo(repo);
              await updateToken(values.writeAPIToken);
            } catch (error) {
              const message = `Could not connect to ${repo.name}`;
              console.error(message, error);
              toast.error(message);
            }
          }}
        >
          {(formikProps) => (
            <form onSubmit={formikProps.handleSubmit}>
              <Box flexDirection="column" gap={4} padding={16}>
                <FormInput
                  disabled={formikProps.isSubmitting}
                  error={typeof formikProps.errors.writeAPIToken === "string"}
                  label="Paste your Write API token"
                  onValueChange={(value) => {
                    void formikProps.setFieldValue("writeAPIToken", value);
                  }}
                  placeholder="Write API token"
                  value={formikProps.values.writeAPIToken}
                />
                <Text color="grey11">
                  Required to sync models from {providerConfig.name} to Prismic.
                </Text>
              </Box>
              <DialogActions>
                <DialogActionLink
                  href={new URL("/settings/apps", repositoryUrl).href}
                >
                  Create a Prismic Write API token
                </DialogActionLink>
                <DialogCancelButton size="medium" />
                <DialogActionButton
                  disabled={!formikProps.isValid}
                  loading={formikProps.isSubmitting}
                  onClick={() => void formikProps.submitForm()}
                  size="medium"
                >
                  Save Token
                </DialogActionButton>
              </DialogActions>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
