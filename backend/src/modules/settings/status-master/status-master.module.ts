import { Module } from '@nestjs/common';
import { StatusMasterController } from './status-master.controller';
import { StatusMasterService } from './status-master.service';

@Module({
  controllers: [StatusMasterController],
  providers: [StatusMasterService],
})
export class StatusMasterModule {}
