import {
  BackgroundIcon,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prismicio/editor-ui";

import { useAiSliceGenerationExperiment } from "@/features/builder/useAiSliceGenerationExperiment";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { SliceTemplate } from "../slicesTemplates/useSlicesTemplates";

type AddSliceDropdownProps = {
  onOpenCreateSliceFromImageModal?: () => Promise<void>;
  onOpenCreateSliceModal?: () => void;
} & (
  | {
      availableSlicesTemplates?: never;
      onOpenSlicesTemplatesModal?: never;
    }
  | {
      availableSlicesTemplates: SliceTemplate[];
      onOpenSlicesTemplatesModal: () => void;
    }
) &
  (
    | {
        availableSlicesToAdd?: never;
        onOpenUpdateSliceZoneModal?: never;
      }
    | {
        availableSlicesToAdd: ComponentUI[];
        onOpenUpdateSliceZoneModal: () => void;
      }
  );

export function AddSliceDropdown(props: AddSliceDropdownProps) {
  const {
    onOpenCreateSliceFromImageModal,
    onOpenCreateSliceModal,
    availableSlicesTemplates,
    onOpenSlicesTemplatesModal,
    availableSlicesToAdd,
    onOpenUpdateSliceZoneModal,
  } = props;
  const aiSliceGenerationExperiment = useAiSliceGenerationExperiment();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          color="purple"
          startIcon="add"
          data-testid="add-new-slice-dropdown"
        >
          Add
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {aiSliceGenerationExperiment.eligible &&
          onOpenCreateSliceFromImageModal && (
            <DropdownMenuItem
              renderStartIcon={() => (
                <BackgroundIcon
                  name="autoFixHigh"
                  size="extraSmall"
                  iconSize="small"
                  radius={6}
                  variant="solid"
                  color="purple"
                />
              )}
              onSelect={() => void onOpenCreateSliceFromImageModal()}
              description="Build a Slice based on your design image."
            >
              Generate from image
            </DropdownMenuItem>
          )}

        {onOpenCreateSliceModal && (
          <DropdownMenuItem
            renderStartIcon={() => (
              <BackgroundIcon
                name="add"
                size="extraSmall"
                iconSize="small"
                radius={6}
                variant="solid"
                color="white"
              />
            )}
            onSelect={onOpenCreateSliceModal}
            description="Build a custom Slice your way."
          >
            Start from scratch
          </DropdownMenuItem>
        )}

        {availableSlicesTemplates && availableSlicesTemplates.length > 0 && (
          <DropdownMenuItem
            onSelect={onOpenSlicesTemplatesModal}
            renderStartIcon={() => (
              <BackgroundIcon
                name="contentCopy"
                size="extraSmall"
                iconSize="small"
                radius={6}
                variant="solid"
                color="white"
              />
            )}
            description="Choose from ready-made examples."
          >
            Use a template
          </DropdownMenuItem>
        )}

        {availableSlicesToAdd && availableSlicesToAdd.length > 0 && (
          <DropdownMenuItem
            onSelect={onOpenUpdateSliceZoneModal}
            renderStartIcon={() => (
              <BackgroundIcon
                name="folder"
                size="extraSmall"
                iconSize="small"
                radius={6}
                variant="solid"
                color="white"
              />
            )}
            description="Select from your created Slices."
          >
            Reuse an existing Slice
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
