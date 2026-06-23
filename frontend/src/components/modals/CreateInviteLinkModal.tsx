import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { Modal } from "../Modal";
import { Link as LinkIcon, X as XIcon, Copy } from "lucide-react";
import { useTheme } from "../../hooks";
import { Dropdown, Checkbox } from "../form";
import type { DropdownOption } from "../form/Dropdown";
import { useCreateInviteLink } from "../../api/mutationHooks";
import Button from "../Button";

type CreateInviteLinkModalProps = {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  teamId: number;
};

const daysOptions: DropdownOption<number>[] = [
  { value: 1, label: "1 day" },
  { value: 2, label: "2 days" },
  { value: 3, label: "3 days" },
  { value: 4, label: "4 days" },
  { value: 5, label: "5 days" },
  { value: 6, label: "6 days" },
  { value: 7, label: "7 days" },
  { value: 8, label: "8 days" },
  { value: 9, label: "9 days" },
  { value: 10, label: "10 days" },
  { value: -1, label: "Infinite" },
];

const maxUsesOptions: DropdownOption<number>[] = [
  { value: 1, label: "1 use" },
  { value: 2, label: "2 uses" },
  { value: 3, label: "3 uses" },
  { value: 4, label: "4 uses" },
  { value: 5, label: "5 uses" },
  { value: 6, label: "6 uses" },
  { value: 7, label: "7 uses" },
  { value: 8, label: "8 uses" },
  { value: 9, label: "9 uses" },
  { value: 10, label: "10 uses" },
  { value: -1, label: "Infinite" },
];

export const CreateInviteLinkModal: FC<CreateInviteLinkModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const { colorMode } = useTheme();
  const [usableForDays, setUsableForDays] = useState<number | number[] | null>(
    7,
  );
  const [maxUses, setMaxUses] = useState<number | number[] | null>(10);
  const [isPermanent, setIsPermanent] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending } = useCreateInviteLink(teamId);

  const handleCreate = () => {
    const daysValue = Array.isArray(usableForDays)
      ? usableForDays[0]
      : usableForDays;
    const usesValue = Array.isArray(maxUses) ? maxUses[0] : maxUses;

    const expiresAt =
      isPermanent || daysValue === -1
        ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + (daysValue || 7) * 24 * 60 * 60 * 1000);

    mutate(
      {
        team_id: teamId,
        expires_at: expiresAt.toISOString(),
        max_uses: isPermanent || usesValue === -1 ? -1 : usesValue || 10,
      },
      {
        onSuccess: (data) => {
          setCreatedToken(data.token);
        },
      },
    );
  };

  const handleClose = () => {
    setCreatedToken(null);
    setUsableForDays(7);
    setMaxUses(10);
    setIsPermanent(false);
    setCopied(false);
    onClose(false);
  };

  const copyToClipboard = () => {
    if (createdToken) {
      const inviteUrl = `${window.location.origin}/invite?token=${createdToken}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdToken ? "Invite Link Created" : "Create Invite Link"}
      subtitle={
        createdToken
          ? "Share this link with your team members"
          : "Configure invite link settings"
      }
      variant="elevated"
      size="md"
      actions={
        createdToken ? (
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose}>
              <XIcon className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={isPending}
            >
              <LinkIcon className="w-4 h-4" />
              {isPending ? "Creating..." : "Create Link"}
            </Button>
          </>
        )
      }
    >
      {createdToken ? (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${
              colorMode === "dark"
                ? "bg-slate-800/50 border-slate-700"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <p
              className={`text-sm font-mono break-all ${
                colorMode === "dark" ? "text-cyan-400" : "text-cyan-600"
              }`}
            >
              {`${window.location.origin}/invite?token=${createdToken}`}
            </p>
          </div>
          <Button
            variant={copied ? "success" : "primary"}
            onClick={copyToClipboard}
            className="w-full"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Checkbox
            checked={isPermanent}
            onChange={(e) => setIsPermanent(e.target.checked)}
            label="Permanent Link"
            variant="default"
            helperText="Link will never expire and has unlimited uses"
          />

          <div className="grid grid-cols-2 gap-4">
            <Dropdown
              label="Usable for"
              value={usableForDays}
              onChange={setUsableForDays}
              options={daysOptions}
              disabled={isPermanent}
              variant="default"
            />

            <Dropdown
              label="Max uses"
              value={maxUses}
              onChange={setMaxUses}
              options={maxUsesOptions}
              disabled={isPermanent}
              variant="default"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};
