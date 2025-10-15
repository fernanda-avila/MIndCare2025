import React from 'react';
import CollaboratorScheduleClient from '../../components/CollaboratorSchedule/CollaboratorScheduleClient';

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return <CollaboratorScheduleClient professionalId={id} />;
}
