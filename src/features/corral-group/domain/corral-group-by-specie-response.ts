import { Line } from '@/features/line/domain';
import { CorralGroup } from './corral-group';

export interface CorralGroupBySpecieResponse extends CorralGroup {
	line: Line;
	idFinishType?: number | null;
}
