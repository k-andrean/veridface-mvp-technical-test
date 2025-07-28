import * as React from "react";
import { Bell } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ActivityLogItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  timestamp: string;
}

const ActivityLogItem = React.forwardRef<HTMLDivElement, ActivityLogItemProps>(
  ({ title, timestamp, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start gap-4 py-2", className)}
        {...props}
      >
        <div className="rounded-full bg-blue-100 p-2">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex flex-col text-sm">
          <p className="font-medium text-gray-800">{title}</p>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
      </div>
    );
  }
);

ActivityLogItem.displayName = "ActivityLogItem";

export { ActivityLogItem };
