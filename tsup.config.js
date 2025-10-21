// tsup.config.js
export default {
  entry: ['src/index.jsx'],
  format: ['esm', 'cjs'],
  dts: false,                 // set to true if you switch to TypeScript
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  external: [
    // Core React
    'react', 
    'react-dom',
    
    // Utilities
    'react-hot-toast',
    'dayjs',
    'dayjs/locale/de',
    'dompurify',
    'axios',
    
    // Radix UI - all components
    '@radix-ui/react-label',
    '@radix-ui/react-popover',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    
    // Date picker
    'react-day-picker',
    
    // MUI - Core and all date picker components
    '@mui/material',
    '@mui/x-date-pickers',
    '@mui/x-date-pickers/LocalizationProvider',
    '@mui/x-date-pickers/AdapterDayjs',
    '@mui/x-date-pickers/DateTimeField',
    
    // Emotion
    '@emotion/react',
    '@emotion/styled',
    
    // React Select
    'react-select',
    'react-select/animated',
    
    // Heroicons
    '@heroicons/react',
    '@heroicons/react/20/solid',
    '@heroicons/react/24/outline'
  ], // keep as peers
  jsx: 'automatic',           // transforms JSX with the new runtime
  esbuildOptions: (options) => {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  }
}