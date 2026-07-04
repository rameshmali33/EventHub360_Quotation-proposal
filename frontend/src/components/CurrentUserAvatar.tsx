

interface CurrentUserAvatarProps {
  sizeClass?: string;
  textClass?: string;
  className?: string;
}

export const getCurrentUserProfile = () => {
  const firstName = localStorage.getItem('user_first_name') || 'Ramesh';
  const lastName = localStorage.getItem('user_last_name') || 'Mali';
  const avatarUrl = localStorage.getItem('user_avatar_url') || '';
  const initials = `${firstName[0] || 'R'}${lastName[0] || 'M'}`.toUpperCase();

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    avatarUrl,
    initials,
  };
};

const CurrentUserAvatar = ({
  sizeClass = 'w-10 h-10',
  textClass = 'text-[13px]',
  className = '',
}: CurrentUserAvatarProps) => {
  const profile = getCurrentUserProfile();

  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold ${textClass} border border-red-200 shadow-sm shrink-0 ${className}`}>
      {profile.initials}
    </div>
  );
};

export default CurrentUserAvatar;
