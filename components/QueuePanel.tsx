/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Job } from '../App';
import Spinner from './Spinner';
import { ClockIcon, XCircleIcon, QueueListIcon } from './icons';

interface QueuePanelProps {
  queue: Job[];
}

const JobStatusIcon: React.FC<{ status: Job['status'] }> = ({ status }) => {
    switch (status) {
        case 'processing':
            return <div className="w-5 h-5"><Spinner /></div>;
        case 'pending':
            return <ClockIcon className="w-5 h-5 text-yellow-400" />;
        case 'failed':
            return <XCircleIcon className="w-5 h-5 text-red-400" />;
        default:
            return null;
    }
}


const QueuePanel: React.FC<QueuePanelProps> = ({ queue }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-2 backdrop-blur-sm h-1/2 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <QueueListIcon className="w-6 h-6 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200">Queue</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {queue.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">The generation queue is empty.</p>
          </div>
        )}
        {queue.map(job => {
          return (
            <div key={job.id} className="bg-gray-900/50 p-3 rounded-lg animate-fade-in">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <JobStatusIcon status={job.status} />
                    <p className="text-sm text-gray-200 truncate" title={job.prompt}>
                        {job.referenceImages.length > 0 && 
                            <span className="font-semibold text-blue-300 mr-2">[{job.referenceImages.length} Ref]</span>
                        }
                        {job.prompt}
                    </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">{job.aspectRatio}</span>
              </div>
              {job.status === 'failed' && (
                <p className="text-xs text-red-400 mt-1 pl-8" title={job.error}>
                    <strong>Failed:</strong> {job.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QueuePanel;