import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { OrderSource, PaymentMethod } from '@cafe/shared-types';

export class OrderItemDto {
  @IsString()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  instructions?: string | null;

  /** Display/API name — used to recover if a stale cart id no longer exists. */
  @IsOptional()
  @IsString()
  name?: string | null;
}

export class CustomerDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(8)
  mobile!: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;
}

export class CreateOrderDto {
  /** Public create is QR/counter only — aggregator orders enter via signed PetPooja webhook. */
  @IsIn(['qr', 'counter'])
  source!: OrderSource;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  tableId?: string | null;
}

export class ReplaceItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class UpdateCustomerDto {
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;
}

export class CheckoutDto {
  @IsIn(['upi', 'card', 'qr', 'cash', 'pay_at_counter'])
  method!: PaymentMethod;
}

export class ConfirmCounterPaymentDto {
  @IsIn(['upi', 'card', 'qr', 'cash'])
  method!: 'upi' | 'card' | 'qr' | 'cash';

  @IsOptional()
  @IsString()
  staffUserId?: string;
}

export class CollectOrderDto {
  @IsOptional()
  @IsString()
  staffUserId?: string;

  /** Deprecated: claim/collect locks bind to authenticated staffUserId. Kept for clients. */
  @IsOptional()
  @IsString()
  staffSessionId?: string;
}

export class ClaimOrderDto {
  @IsOptional()
  @IsString()
  staffSessionId?: string;
}
