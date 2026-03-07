// Example usage of the Button component
import { Button, LinkButton } from '@/components/Button';
import { Add, Download, CalendarMonth } from '@mui/icons-material';

// Basic usage examples
export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex gap-4">
          <Button size="sm">Small Button</Button>
          <Button>Default Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Shapes</h3>
        <div className="flex gap-4">
          <Button>Rounded</Button>
          <Button shape="pill">Pill Shape</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Link Buttons</h3>
        <div className="flex gap-4">
          <LinkButton href="/calendar">Link Button</LinkButton>
          <LinkButton href="/calendar" shape="pill">Pill Link</LinkButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons (Custom Implementation)</h3>
        <div className="flex gap-4">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Add className="mr-2" fontSize="small" />
            Add New
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="mr-2" fontSize="small" />
            Download
          </button>
          <button className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black">
            <CalendarMonth className="mr-2" fontSize="small" />
            Calendar
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="flex gap-4">
          <Button variant="yellow">Yellow</Button>
          <Button variant="blue">Blue</Button>
          <Button variant="red">Red</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pill Variants</h3>
        <div className="flex gap-4">
          <Button variant="yellow-pill">Yellow Pill</Button>
          <Button variant="blue-pill">Blue Pill</Button>
          <Button variant="red-pill">Red Pill</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Disabled State</h3>
        <div className="flex gap-4">
          <Button disabled>Disabled Button</Button>
        </div>
      </div>
    </div>
  );
}
