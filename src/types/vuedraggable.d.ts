declare module "vuedraggable" {
  import { DefineComponent } from "vue";

  const Draggable: DefineComponent<{
    modelValue: unknown[];
    itemKey: string | ((element: unknown) => string | number);
    handle?: string;
    tag?: string;
    ghostClass?: string;
    animation?: number;
    group?:
      | string
      | { name: string; pull?: boolean | string; put?: boolean | string };
    disabled?: boolean;
  }>;

  export default Draggable;
}
