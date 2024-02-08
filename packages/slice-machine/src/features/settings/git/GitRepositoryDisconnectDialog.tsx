import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Text,
} from "@prismicio/editor-ui";
import type { GitRepoSpecifier } from "@slicemachine/manager";
import { type FC, type ReactNode, useState } from "react";
import { toast } from "react-toastify";

type GitRepositoryDisconnectDialogProps = {
  repo: GitRepoSpecifier;
  trigger: ReactNode;
  unlinkRepo: (repo: GitRepoSpecifier) => Promise<void>;
};

export const GitRepositoryDisconnectDialog: FC<
  GitRepositoryDisconnectDialogProps
> = ({ repo, trigger, unlinkRepo }) => {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog size={{ width: 448, height: "auto" }} trigger={trigger}>
      <DialogHeader title="Remove Git Connection" />
      <DialogContent>
        <Box flexDirection="column" padding={16}>
          <Text>
            You will not be able to push your code alongside your models
            anymore. Note that you can reconnect your Git repository at any
            time. Are you sure you want to continue?
          </Text>
        </Box>
      </DialogContent>
      <DialogActions
        asFooter
        cancel={{ text: "Cancel" }}
        ok={{
          color: "tomato",
          loading,
          onClick: () => {
            void (async () => {
              setLoading(true);
              try {
                await unlinkRepo(repo);
              } catch (error) {
                const message = `Could not disconnect from ${repo.name}`;
                console.error(message, error);
                toast.error(message);
              }
              setLoading(false);
            })();
          },
          text: "Disconnect",
        }}
        size="medium"
      />
    </Dialog>
  );
};
