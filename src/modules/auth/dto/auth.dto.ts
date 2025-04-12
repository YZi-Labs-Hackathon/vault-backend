import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
    @ApiProperty({ type: String, example: 'Hello, world!' })
    @IsNotEmpty()
    @IsString()
    challengeCode: string;

    @ApiProperty({ type: String, example: '4DeTnfuAY4kgBZa1pYjih3WzVnTBFE2LjMzCxXgdTcE4' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ type: String, example: '0x' })
    @IsNotEmpty()
    @IsString()
    signature: string;
}

export class LoginResponse {
    @ApiProperty({
        type: String,
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @ApiProperty({
        type: String,
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

export class RefreshTokenRequest {
    @ApiProperty({
        type: String,
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

export class RefreshTokenResponse {
    @ApiProperty({
        type: String,
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    accessToken: string;

    @ApiProperty({
        type: String,
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    refreshToken: string;
}

export class ChallengeCodeResponse {
    @ApiProperty({ type: String, example: 'Hello, world!' })
    challengeCode: string;
}
