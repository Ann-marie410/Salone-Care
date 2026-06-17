import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacy_id, customer_name, customer_phone, notes, items, total_amount } = body;

    console.log('[ORDERS API] Creating order:', { pharmacy_id, customer_name, customer_phone, items: items?.length, total_amount });

    if (!pharmacy_id || !customer_name || !customer_phone || !items || !items.length) {
      console.log('[ORDERS API] Missing fields:', { pharmacy_id, customer_name, customer_phone, items: !!items, itemsLength: items?.length });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        pharmacy_id,
        customer_name,
        customer_phone,
        notes: notes || null,
        total_amount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const orderItems = items.map((item: { medicine_id?: string; medicine_name: string; price: number; quantity: number }) => ({
      order_id: order.id,
      medicine_id: item.medicine_id || null,
      medicine_name: item.medicine_name,
      price: item.price,
      quantity: item.quantity,
    }));

    console.log('[ORDERS API] Inserting order items:', orderItems.length);

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('[ORDERS API] Order items insert error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacy_id');

    let query = supabaseAdmin.from('orders').select('*');

    if (pharmacyId) {
      query = query.eq('pharmacy_id', pharmacyId);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch orders error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        return { ...order, items: items || [] };
      })
    );

    return NextResponse.json({ data: ordersWithItems });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'order_id and status are required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', order_id);

    if (error) {
      console.error('Update order error:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
