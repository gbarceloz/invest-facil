import { CameraMovement } from "../CameraMovement";
import { ProductBasket } from "../ProductBasket";

export function BasketScene() {
  return (
    <CameraMovement from={282} to={405} zoomFrom={1.02} zoomTo={1.055} panY={-6}>
      <div style={{ position: "absolute", inset: 0 }}>
        <ProductBasket />
      </div>
    </CameraMovement>
  );
}
