import { Button } from "./Button";
import { Input } from "./Input";

export function EditingMessage(
  { editMessage, editingContent, setEditingContent, setIsEditing }:
    {
      editMessage: (e: React.SubmitEvent) => Promise<void>,
      editingContent: string,
      setEditingContent: (editingContent: string) => void,
      setIsEditing: (isEditing: boolean) => void
    }) {
  return (
    <form
      onSubmit={editMessage}
      className="flex flex-col items-end w-full px-4 py-1.5"
    >
      <Input
        value={editingContent}
        onChange={(e) => setEditingContent(e.target.value)}
        autoFocus
        className="max-w-[85%] sm:max-w-[75%] md:max-w-md w-full"
      />

      <div className="flex items-center gap-2 mt-2">
        <Button
          type="button"
          varient="ghost"
          className="small-btn"
          onClick={() => {
            setIsEditing(false);
            setEditingContent("");
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="px-3 py-1.5 text-xs"
        >
          Save
        </Button>
      </div>
    </form>
  )
}
