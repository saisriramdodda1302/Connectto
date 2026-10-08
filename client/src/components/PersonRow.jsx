import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fullName } from '../lib/format';
import Avatar from './Avatar';
import FollowButton from './FollowButton';

export default function PersonRow({ person }) {
  const { user } = useAuth();
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link to={`/people/${person.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar user={person} size="sm" />
        <span className="truncate font-medium hover:underline">{fullName(person)}</span>
      </Link>
      {person.id !== user.id && <FollowButton id={person.id} following={person.is_following} />}
    </li>
  );
}
