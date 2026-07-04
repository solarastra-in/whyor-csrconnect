import re
with open('components/ui/dialog.tsx', 'r') as f:
    content = f.read()

# Make DialogContent more spacious (p-6) and max-w-md
content = content.replace(
    'p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm',
    'p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-md md:max-w-lg lg:max-w-xl'
)

# Make DialogFooter match padding
content = content.replace(
    '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end',
    '-mx-6 -mb-6 mt-6 flex flex-col-reverse gap-3 rounded-b-xl border-t bg-muted/50 p-6 sm:flex-row sm:justify-end'
)

with open('components/ui/dialog.tsx', 'w') as f:
    f.write(content)
