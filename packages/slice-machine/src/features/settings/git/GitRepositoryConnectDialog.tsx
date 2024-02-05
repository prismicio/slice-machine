import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormInput,
  Text,
} from "@prismicio/editor-ui";
import type { GitRepo, GitRepoSpecifier } from "@slicemachine/manager";
import { Formik } from "formik";
import type { FC, ReactNode } from "react";
import { toast } from "react-toastify";

import { gitProviderToConfig } from "@src/features/settings/git/GitProvider";
import { useWriteAPIToken } from "@src/features/settings/git/useWriteAPIToken";

type GitRepositoryConnectDialogProps = {
  linkRepo: (repo: GitRepoSpecifier) => Promise<void>;
  repo: GitRepo;
  trigger: ReactNode;
};

export const GitRepositoryConnectDialog: FC<
  GitRepositoryConnectDialogProps
> = ({ linkRepo, repo, trigger }) => {
  const providerConfig = gitProviderToConfig[repo.provider];
  const { updateToken } = useWriteAPIToken({ git: repo });
  return (
    <Dialog size={{ width: 448, height: "auto" }} trigger={trigger}>
      <DialogHeader title="Prismic write API token required" />
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
              await updateToken(values.writeAPIToken);
              await linkRepo(repo);
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
                  label="Paste your write API token"
                  onValueChange={(value) => {
                    void formikProps.setFieldValue("writeAPIToken", value);
                  }}
                  placeholder="Write API token"
                  size="large"
                  value={formikProps.values.writeAPIToken}
                />
                <Text color="grey11">
                  Required to update your Prismic repository with{" "}
                  {providerConfig.name}.
                </Text>
              </Box>
              <DialogActions
                cancel={{ text: "Cancel" }}
                ok={{
                  disabled: !formikProps.isValid,
                  loading: formikProps.isSubmitting,
                  onClick: () => void formikProps.submitForm(),
                  text: "Save Token",
                }}
                size="medium"
              />
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
