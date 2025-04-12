import { Controller, ParseFilePipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import mime from 'mime-types';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from '@app/common/interceptors/response.transform.interceptor';
import { FileDto } from '@app/modules/shared/dto/file.dto';
import { S3FileService } from '@app/modules/shared/services/s3.file.service';
import { multerOptions } from '@app/common/utils';
import { JWTGuard } from '@app/modules/auth/guards/jwt.guard';

@ApiTags('File')
@Controller('file')
@ApiBearerAuth('accessBearer')
@UseGuards(JWTGuard)
export class FileController {
    constructor(private readonly s3FileService: S3FileService) {}

    @Post('upload')
    @ApiExtraModels(ResponseDto)
    @ApiExtraModels(FileDto)
    @ApiResponse({
        schema: {
            $ref: getSchemaPath(ResponseDto),
            properties: {
                data: { $ref: getSchemaPath(FileDto) },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file', multerOptions))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['file'],
        },
    })
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: true,
            })
        )
        file: any
    ) {
        const extension = mime.extension(file.mimetype);

        const url = await this.s3FileService.uploadPublicFile(file.buffer, extension, 'hackathon/vault');
        return { url };
    }
}
