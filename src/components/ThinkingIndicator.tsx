import InayaAvatar from "./InayaAvatar";

const ThinkingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-card border border-border">
        <div className="flex items-center gap-3">
          <InayaAvatar size="sm" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Inaya gondolkodik</span>
            <div className="flex gap-1 ml-1">
              <span 
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0ms", animationDuration: "1s" }}
              />
              <span 
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "150ms", animationDuration: "1s" }}
              />
              <span 
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "300ms", animationDuration: "1s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
