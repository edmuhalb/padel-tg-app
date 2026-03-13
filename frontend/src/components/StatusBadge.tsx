import { STATUS_LABELS, STATUS_COLORS, type GameStatus } from '../types';

export function StatusBadge({ status }: { status: GameStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
