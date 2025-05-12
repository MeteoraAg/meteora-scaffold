import { ComponentProps } from 'react';

type ExternalLinkProps = ComponentProps<'a'>;
export const ExternalLink: React.FC<ExternalLinkProps> = (props) => {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
};
