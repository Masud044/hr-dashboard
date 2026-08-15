// src/features/ticketing/components/AssignAgentDropdown.jsx
import { toast } from "react-toastify";
import EntityCombobox from "@/components/shared/entity-combobox";
import { useAssignAgent } from "../queries";

/**
 * agentOpts: [{ value: userId, label: username }]
 */
export default function AssignAgentDropdown({ ticketId, currentAgentId, agentOpts = [] }) {
  const assignAgent = useAssignAgent();

  const handleChange = (agentId) => {
    if (!agentId || agentId === String(currentAgentId)) return;
    assignAgent.mutate(
      { ticketId, agentId },
      {
        onSuccess: () => toast.success("Agent assigned."),
        onError: (err) => toast.error(err?.message || "Failed to assign agent."),
      }
    );
  };

  return (
    <EntityCombobox
      items={agentOpts}
      value={currentAgentId ? String(currentAgentId) : ""}
      onValueChange={handleChange}
      placeholder="Unassigned"
      size="sm"
      className="w-full"
      disabled={assignAgent.isPending}
      showAvatar
      avatarInTrigger
    />
  );
}