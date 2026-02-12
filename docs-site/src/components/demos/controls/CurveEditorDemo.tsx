import DemoWrapper from '../DemoWrapper';
import { CurveEditor } from '@/components/controls';

export default function CurveEditorDemo() {
  return (
    <DemoWrapper withKeyboard>
      <CurveEditor width={440} height={260} />
    </DemoWrapper>
  );
}
