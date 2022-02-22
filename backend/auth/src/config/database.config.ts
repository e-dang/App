import {Transform} from "class-transformer";
import {IsBoolean, IsDefined, IsNumber, IsPositive, IsString} from "class-validator";

export class DatabaseConfig {
  @IsString()
  @IsDefined()
  readonly dbHost: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly dbPort: number;

  @IsString()
  @IsDefined()
  readonly dbUser: string;

  @IsString()
  @IsDefined()
  readonly dbPassword: string;

  @IsString()
  @IsDefined()
  readonly dbName: string;

  @Transform(({obj}: {obj: Record<string, unknown>}) => obj.dbSsl === true || obj.dbSsl === "true")
  @IsBoolean()
  @IsDefined()
  readonly dbSsl: boolean;

  @Transform(({obj}: {obj: Record<string, unknown>}) => obj.dbSsl === true || obj.dbSsl === "true")
  @IsBoolean()
  @IsDefined()
  readonly runMigrations: boolean;
}
