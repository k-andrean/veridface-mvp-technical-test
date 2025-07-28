import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/Card';
import { UserCardProps } from '../../types/user';
import { ActivityLogItem } from '../ui/ActivityLogItem';

export const UserCard: React.FC<UserCardProps> = ({ user, activityLogs }) => {
  return (
    <div className="max-w-5xl mx-auto my-6 space-y-6">
      {/* User Info Card */}
      <Card className='border border-gray-300 shadow-lg'>
        <CardHeader>
          <CardTitle className="text-blue-900">User Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-x-8 gap-y-8 mt-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-gray-800 mr-4">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold text-gray-800 mr-4">Email:</span> {user.email}
          </p>
          <p className='text-blue-800'>
            <span className="font-semibold text-gray-800 mr-4">Phone:</span> {user.phoneNumber}
          </p>
          <p className='text-blue-800'>
            <span className="font-semibold text-gray-800 mr-4">Digital ID:</span> {user.digitalID}
          </p>
          {/* <p>
            <span className="font-semibold text-gray-800 mr-4">Event:</span> {user.event}
          </p> */}
          <p className='text-blue-800'>
            <span className="font-semibold text-gray-800 mr-4">Created At:</span>{' '}
            {new Date(user.time).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Activity Log Card */}
      <Card className='border border-gray-300 shadow-lg'>
        <CardHeader>
          <CardTitle className="text-red-400">Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-200">
          {activityLogs.map((activity, index) => (
            <ActivityLogItem
              key={index}
              title={activity.title}
              timestamp={activity.timestamp}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCard;
