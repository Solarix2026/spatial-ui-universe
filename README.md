# Spatial UI Universe

`spatial-ui-universe` is a React-based spatial and 3D UI component library that powers immersive web experiences, leveraging libraries like `three` and `@react-three/fiber` to build beautiful and interactive 3D scenes.

## Features
- **Immersive 3D Spaces**: Build interactive background scenes seamlessly.
- **Easy Integration**: Ready to use components for React apps.
- **Lightweight**: Fast rendering using `@react-three/fiber`.

## Installation

```bash
npm install spatial-ui-universe
```

## Quick Start

Import the components and use them directly in your React application:

```tsx
import { Scene, AccessModal } from 'spatial-ui-universe';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Scene />
      <AccessModal />
    </div>
  );
}

export default App;
```

## Technologies Used
- React
- React Three Fiber
- Framer Motion
- Three.js
- Tailwind CSS

## License
MIT
