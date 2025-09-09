'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, Clock } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Advanced task management and organization features.
          </p>
        </div>
      </div>

      <Card className="border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Construction className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Advanced Task Features Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            We're working on advanced task management features including bulk operations, 
            custom views, advanced filtering, and task templates.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Expected release: Q2 2024</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Select multiple tasks and perform bulk actions like status changes, 
              priority updates, and tag assignments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Create custom views with personalized filters, sorting options, 
              and column configurations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Create reusable task templates for recurring workflows and 
              common project structures.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
