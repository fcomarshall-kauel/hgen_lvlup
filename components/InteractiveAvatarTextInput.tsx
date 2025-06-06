import { Input, Spinner, Tooltip, Button } from "@nextui-org/react";
import { Send } from "lucide-react"; // Reemplazo de PaperPlaneRight
import clsx from "clsx";

interface StreamingAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: () => void;
  setInput: (value: string) => void;
  endContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function InteractiveAvatarTextInput({
  label,
  placeholder,
  input,
  onSubmit,
  setInput,
  endContent,
  disabled = false,
  loading = false,
}: StreamingAvatarTextInputProps) {
  function handleSubmit() {
    if (input.trim() === "") {
      return;
    }
    onSubmit();
    setInput("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent form submission
      handleSubmit();
    }
  };

  return (
    <Input
      endContent={
        <div className="flex flex-row items-center h-full">
          {endContent}
          <Tooltip content="Send message">
            {loading ? (
              <Spinner
                className="text-indigo-300 hover:text-indigo-200"
                size="sm"
                color="default"
              />
            ) : (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleSubmit}
                isDisabled={disabled}
                className="min-w-0 p-0 h-auto bg-transparent"
              >
                <Send
                  className={clsx(
                    "text-indigo-300 hover:text-indigo-200",
                    disabled && "opacity-50"
                  )}
                  size={24}
                />
              </Button>
            )}
          </Tooltip>
        </div>
      }
      label={label}
      placeholder={placeholder}
      size="sm"
      value={input}
      onKeyDown={handleKeyDown}
      onValueChange={setInput}
      isDisabled={disabled}
    />
  );
}
