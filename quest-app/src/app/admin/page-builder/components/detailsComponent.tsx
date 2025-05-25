// app/admin/page-builder/components/detailsComponent.tsx
import React from 'react';
import { Calendar, MapPin, Ruler, Package } from 'lucide-react';
import { ArtifactDetails } from '@/lib/types';

interface DetailsComponentProps {
  content: ArtifactDetails;
  onUpdate: (content: ArtifactDetails) => void;
}

export const DetailsComponent = ({ content, onUpdate }: DetailsComponentProps) => {
  const handleInputChange = (field: keyof ArtifactDetails, value: string) => {
    onUpdate({
      ...content,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Artifact Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Created Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            Created
          </label>
          <input
            type="text"
            value={content.created || ''}
            onChange={(e) => handleInputChange('created', e.target.value)}
            placeholder="e.g., May 24, 2025 or 15th century"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>        {/* Origin Location */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-gray-500" />
            Origin
          </label>
          <input
            type="text"
            value={content.origin || ''}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            placeholder="e.g., Ancient Rome, Egypt"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Current Location */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 text-gray-500" />
            Current Location
          </label>
          <input
            type="text"
            value={content.currentLocation || ''}
            onChange={(e) => handleInputChange('currentLocation', e.target.value)}
            placeholder="e.g., British Museum, London"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Ruler className="w-4 h-4 text-gray-500" />
            Dimensions
          </label>
          <input
            type="text"
            value={content.dimensions || ''}
            onChange={(e) => handleInputChange('dimensions', e.target.value)}
            placeholder="e.g., 15 x 10 x 5 cm"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Materials */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Package className="w-4 h-4 text-gray-500" />
            Materials
          </label>
          <input
            type="text"
            value={content.materials || ''}
            onChange={(e) => handleInputChange('materials', e.target.value)}
            placeholder="e.g., Clay, Bronze, Stone"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Created:</span>
            <span>{content.created || 'Not specified'}</span>
          </div>          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Origin:</span>
            <span>{content.origin || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Current Location:</span>
            <span>{content.currentLocation || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <span className="font-medium">Dimensions:</span>
            <span>{content.dimensions || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="font-medium">Materials:</span>
            <span>{content.materials || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};