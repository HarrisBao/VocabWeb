import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { StudentNavbar } from './StudentNavbar';

export const StudentLayout: React.FC = () => {
  const { classSlug } = useParams<{ classSlug?: string }>();
  const basePath = classSlug ? `/class/${classSlug}/portal` : `/student`;

  return (
    <div className="min-h-screen bg-page-student flex flex-col">
      <StudentNavbar classSlug={classSlug} basePath={basePath} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
