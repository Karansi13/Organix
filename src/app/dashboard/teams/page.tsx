'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, Clock, Users, UserPlus, Share2 } from 'lucide-react';

export default function TeamsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teams
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Collaboration and team management features.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      <Card className="border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Team Collaboration Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            We're developing comprehensive team features including shared workspaces, 
            real-time collaboration, and advanced permission controls.
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
            <CardTitle className="text-lg">Shared Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Create team workspaces with shared boards, tasks, and real-time 
              collaboration features for seamless teamwork.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role-based Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Granular permission controls for team members including admin, 
              editor, and viewer roles with custom access levels.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Track team activity, see who's working on what, and get insights 
              into team productivity and collaboration patterns.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Built-in messaging system for team communication, task discussions, 
              and instant notifications about project updates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Comprehensive analytics and reporting on team performance, 
              task completion rates, and productivity metrics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">External Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Share boards and tasks with external stakeholders and clients 
              with controlled access and public link sharing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
