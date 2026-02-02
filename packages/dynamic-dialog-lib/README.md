# Dynamic Dialog

A flexible, reusable React dialog component built on Radix UI Dialog with Tailwind CSS styling.

## Installation

```bash
npm install ynotsoft-dynamic-dialog
# or
yarn add ynotsoft-dynamic-dialog
# or
bun add ynotsoft-dynamic-dialog
```

## Usage

```jsx
import DynamicDialog from 'ynotsoft-dynamic-dialog';
import 'ynotsoft-dynamic-dialog/index.css';

function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      
      <DynamicDialog
        open={open}
        onOpenChange={setOpen}
        title="Example Dialog"
        description="This is an example dialog component"
        footer={
          <>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button onClick={() => setOpen(false)}>Confirm</button>
          </>
        }
      >
        <p>Your dialog content goes here</p>
      </DynamicDialog>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls dialog visibility |
| `onOpenChange` | `function` | - | Callback when open state changes |
| `title` | `string` | - | Dialog title |
| `description` | `string` | - | Dialog description |
| `children` | `ReactNode` | - | Dialog content |
| `footer` | `ReactNode` | - | Dialog footer content |
| `className` | `string` | - | Additional classes for dialog content |
| `showCloseButton` | `boolean` | `true` | Show/hide close button |

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build library
bun run build
```

## License

MIT
