import type { CorralGroup } from './corral-group';
import type { Line } from '@/features/line/domain';

export interface GetAllCorralGroup extends CorralGroup {
	line: Line;
}
